import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { createMint, getAccount, getOrCreateAssociatedTokenAccount, mintTo, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Keypair, PublicKey, SYSVAR_RENT_PUBKEY, SystemProgram } from "@solana/web3.js";
import assert from "node:assert/strict";

import { ResonanceGenesis } from "../target/types/resonance_genesis";

const RE_DECIMALS = 1_000_000_000n;

declare function describe(name: string, fn: () => void): void;
declare function it(name: string, fn: () => Promise<void>): void;

function pda(seed: string, programId: PublicKey) {
  return PublicKey.findProgramAddressSync([Buffer.from(seed)], programId);
}

function mintPda(seed: string, mint: PublicKey, programId: PublicKey) {
  return PublicKey.findProgramAddressSync([Buffer.from(seed), mint.toBuffer()], programId);
}

async function expectRejected(promise: Promise<unknown>, message?: string) {
  try {
    await promise;
    throw new Error("Expected transaction to fail");
  } catch (error) {
    const text = String((error as Error).message || error);
    if (message) assert.ok(text.includes(message), `Expected error to include ${message}, got: ${text}`);
  }
}

describe("resonance_genesis", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.ResonanceGenesis as Program<ResonanceGenesis>;
  const authority = provider.wallet.publicKey;
  const nonOwner = Keypair.generate();

  it("runs the real Solana miner lifecycle", async () => {
    await provider.connection.confirmTransaction(await provider.connection.requestAirdrop(nonOwner.publicKey, 2_000_000_000), "confirmed");

    const [globalConfig] = pda("global_config", program.programId);
    const [reMintAuthority] = pda("re_mint_authority", program.programId);
    const [vaultAuthority] = pda("vault_authority", program.programId);

    const reMint = await createMint(provider.connection, provider.wallet.payer, reMintAuthority, null, 9);
    const collectionMint = await createMint(provider.connection, provider.wallet.payer, authority, null, 0);
    const nftMint = await createMint(provider.connection, provider.wallet.payer, authority, null, 0);
    const userNftAccount = await getOrCreateAssociatedTokenAccount(provider.connection, provider.wallet.payer, nftMint, authority);
    await mintTo(provider.connection, provider.wallet.payer, nftMint, userNftAccount.address, provider.wallet.payer, 1);

    const userReAccount = await getOrCreateAssociatedTokenAccount(provider.connection, provider.wallet.payer, reMint, authority);
    const nonOwnerReAccount = await getOrCreateAssociatedTokenAccount(provider.connection, provider.wallet.payer, reMint, nonOwner.publicKey);
    const nonOwnerNftAccount = await getOrCreateAssociatedTokenAccount(provider.connection, provider.wallet.payer, nftMint, nonOwner.publicKey);

    await program.methods
      .initialize({ treasury: authority, energyScale: new anchor.BN(1) })
      .accountsStrict({
        authority,
        reMint,
        collectionMint,
        globalConfig,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const config = await program.account.globalConfig.fetch(globalConfig);
    assert.equal(config.reMint.toBase58(), reMint.toBase58());
    assert.equal(config.collectionMint.toBase58(), collectionMint.toBase58());
    assert.equal(config.minClaimRe.toString(), (33n * RE_DECIMALS).toString());
    assert.equal(config.maxReSupply.toString(), (1_000_000_000n * RE_DECIMALS).toString());

    const [nodeTraits] = mintPda("node_traits", nftMint, program.programId);
    await program.methods
      .setNodeTraits({
        nftMint,
        frequency: 888,
        modeN: 14,
        modeM: 16,
        nodeDensityBps: 2800,
        lineThicknessBps: 107,
        rarityTier: 2,
        patternFamilyHash: 123456,
      })
      .accountsStrict({
        authority,
        globalConfig,
        nodeTraits,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const traits = await program.account.nodeTraits.fetch(nodeTraits);
    assert.equal(traits.initialized, true);
    assert.equal(traits.frequency, 888);

    const [vaultNftAccount] = mintPda("vault", nftMint, program.programId);
    const [stakeAccount] = mintPda("stake", nftMint, program.programId);

    await program.methods
      .stakeNode()
      .accountsStrict({
        owner: authority,
        globalConfig,
        nftMint,
        nodeTraits,
        userNftAccount: userNftAccount.address,
        vaultNftAccount,
        vaultAuthority,
        stakeAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    assert.equal((await getAccount(provider.connection, userNftAccount.address)).amount, 0n);
    assert.equal((await getAccount(provider.connection, vaultNftAccount)).amount, 1n);

    await expectRejected(
      program.methods
        .claimRe()
        .accountsStrict({
          owner: authority,
          globalConfig,
          reMint,
          userReAccount: userReAccount.address,
          nodeTraits,
          stakeAccount,
          reMintAuthority,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc(),
      "MinimumClaimNotReached",
    );

    await expectRejected(
      program.methods
        .claimRe()
        .accountsStrict({
          owner: nonOwner.publicKey,
          globalConfig,
          reMint,
          userReAccount: nonOwnerReAccount.address,
          nodeTraits,
          stakeAccount,
          reMintAuthority,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([nonOwner])
        .rpc(),
      "NotStakeOwner",
    );

    await expectRejected(
      program.methods
        .unstakeNode()
        .accountsStrict({
          owner: nonOwner.publicKey,
          globalConfig,
          nftMint,
          userNftAccount: nonOwnerNftAccount.address,
          vaultNftAccount,
          vaultAuthority,
          stakeAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([nonOwner])
        .rpc(),
      "NotStakeOwner",
    );

    await new Promise((resolve) => setTimeout(resolve, 1200));

    await program.methods
      .claimRe()
      .accountsStrict({
        owner: authority,
        globalConfig,
        reMint,
        userReAccount: userReAccount.address,
        nodeTraits,
        stakeAccount,
        reMintAuthority,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    const reBalance = (await getAccount(provider.connection, userReAccount.address)).amount;
    assert.ok(reBalance > 33n * RE_DECIMALS, `Expected RE balance above 33 RE, got ${reBalance}`);

    await program.methods
      .unstakeNode()
      .accountsStrict({
        owner: authority,
        globalConfig,
        nftMint,
        userNftAccount: userNftAccount.address,
        vaultNftAccount,
        vaultAuthority,
        stakeAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    assert.equal((await getAccount(provider.connection, userNftAccount.address)).amount, 1n);
    assert.equal((await getAccount(provider.connection, vaultNftAccount)).amount, 0n);
  });
});
