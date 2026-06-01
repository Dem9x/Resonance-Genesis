import { createMint } from "@solana/spl-token";
import { Connection, Keypair, clusterApiUrl } from "@solana/web3.js";
import { reMintAuthorityPda } from "./derive-pdas";
import fs from "node:fs";
import os from "node:os";

const rpcUrl = process.env.SOLANA_RPC_URL || clusterApiUrl("devnet");
const payerPath = process.env.SOLANA_KEYPAIR || `${os.homedir()}/.config/solana/id.json`;
const payer = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(payerPath, "utf8"))));
const connection = new Connection(rpcUrl, "confirmed");

async function main() {
  const [mintAuthority] = reMintAuthorityPda();
  const mint = await createMint(connection, payer, mintAuthority, null, 9);
  console.log("RE_MINT_ADDRESS=", mint.toBase58());
  console.log("Mint authority PDA=", mintAuthority.toBase58());
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
