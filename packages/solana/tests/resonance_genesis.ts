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

function tokenIdBytes(tokenId: number) {
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64LE(BigInt(tokenId));
  return buffer;
}

function mintRecordPda(tokenId: number, programId: PublicKey) {
  return PublicKey.findProgramAddressSync([Buffer.from("mint_record"), tokenIdBytes(tokenId)], programId);
}

function registerArgs(tokenId: number, nftMint: PublicKey) {
  return {
    tokenId: new anchor.BN(tokenId),
    nftMint,
    metadataUriHash: tokenId,
    frequency: 963,
    modeN: 6,
    modeM: 8,
    nodeDensityBps: 920,
    lineThicknessBps: 102,
    rarityTier: 2,
    patternFamilyHash: 12345 + tokenId,
  };
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
  const programAny = program as any;
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
      .initialize({ treasury: authority, energyScale: new anchor.BN(1), maxSupply: new anchor.BN(2) })
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
    assert.equal((config as any).nextTokenId.toString(), "1");
    assert.equal((config as any).mintedCount.toString(), "0");
    assert.equal((config as any).maxSupply.toString(), "2");

    const [mintRecord1] = mintRecordPda(1, program.programId);
    const [registeredNodeTraits1] = mintPda("node_traits", nftMint, program.programId);
    await programAny.methods
      .registerNodeMint(registerArgs(1, nftMint))
      .accountsStrict({
        owner: authority,
        globalConfig,
        nftMint,
        mintRecord: mintRecord1,
        nodeTraits: registeredNodeTraits1,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const record1 = await programAny.account.mintRecord.fetch(mintRecord1);
    assert.equal(record1.tokenId.toString(), "1");
    assert.equal(record1.nftMint.toBase58(), nftMint.toBase58());
    assert.equal(record1.owner.toBase58(), authority.toBase58());

    const configAfterFirstMint = await program.account.globalConfig.fetch(globalConfig);
    assert.equal((configAfterFirstMint as any).nextTokenId.toString(), "2");
    assert.equal((configAfterFirstMint as any).mintedCount.toString(), "1");

    await expectRejected(
      programAny.methods
        .registerNodeMint(registerArgs(1, nftMint))
        .accountsStrict({
          owner: authority,
          globalConfig,
          nftMint,
          mintRecord: mintRecord1,
          nodeTraits: registeredNodeTraits1,
          systemProgram: SystemProgram.programId,
        })
        .rpc(),
    );

    const nftMint2 = await createMint(provider.connection, provider.wallet.payer, authority, null, 0);
    const userNftAccount2 = await getOrCreateAssociatedTokenAccount(provider.connection, provider.wallet.payer, nftMint2, authority);
    await mintTo(provider.connection, provider.wallet.payer, nftMint2, userNftAccount2.address, provider.wallet.payer, 1);
    const [mintRecord2] = mintRecordPda(2, program.programId);
    const [registeredNodeTraits2] = mintPda("node_traits", nftMint2, program.programId);
    await programAny.methods
      .registerNodeMint(registerArgs(2, nftMint2))
      .accountsStrict({
        owner: authority,
        globalConfig,
        nftMint: nftMint2,
        mintRecord: mintRecord2,
        nodeTraits: registeredNodeTraits2,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const configAfterSecondMint = await program.account.globalConfig.fetch(globalConfig);
    assert.equal((configAfterSecondMint as any).nextTokenId.toString(), "3");
    assert.equal((configAfterSecondMint as any).mintedCount.toString(), "2");

    const nftMint3 = await createMint(provider.connection, provider.wallet.payer, authority, null, 0);
    const userNftAccount3 = await getOrCreateAssociatedTokenAccount(provider.connection, provider.wallet.payer, nftMint3, authority);
    await mintTo(provider.connection, provider.wallet.payer, nftMint3, userNftAccount3.address, provider.wallet.payer, 1);
    const [mintRecord3] = mintRecordPda(3, program.programId);
    const [registeredNodeTraits3] = mintPda("node_traits", nftMint3, program.programId);
    await expectRejected(
      programAny.methods
        .registerNodeMint(registerArgs(3, nftMint3))
        .accountsStrict({
          owner: authority,
          globalConfig,
          nftMint: nftMint3,
          mintRecord: mintRecord3,
          nodeTraits: registeredNodeTraits3,
          systemProgram: SystemProgram.programId,
        })
        .rpc(),
      "SoldOut",
    );

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
