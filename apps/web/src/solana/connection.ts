import { Connection } from "@solana/web3.js";
import { solanaRpcUrl } from "@/solana/constants";

export const solanaConnection = new Connection(solanaRpcUrl, "confirmed");
