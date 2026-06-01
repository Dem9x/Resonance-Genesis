import resonanceGenesisAbi from "@/abi/ResonanceGenesis.json";
import minerAbi from "@/abi/ChladniNodeMiner.json";
import resonanceEnergyAbi from "@/abi/ResonanceEnergy.json";
import type { Abi } from "viem";

const emptyAddress = "0x0000000000000000000000000000000000000000";

function envAddress(value: string | undefined): `0x${string}` | undefined {
  return value && value !== emptyAddress ? (value as `0x${string}`) : undefined;
}

export const resonanceGenesisAddress = envAddress(process.env.NEXT_PUBLIC_RESONANCE_GENESIS_ADDRESS);
export const chladniNodeMinerAddress = envAddress(process.env.NEXT_PUBLIC_CHLADNI_NODE_MINER_ADDRESS);
export const resonanceEnergyAddress = envAddress(process.env.NEXT_PUBLIC_RESONANCE_ENERGY_ADDRESS);

export const contracts = {
  resonanceGenesis: {
    address: resonanceGenesisAddress,
    abi: resonanceGenesisAbi as Abi
  },
  miner: {
    address: chladniNodeMinerAddress,
    abi: minerAbi as Abi
  },
  resonanceEnergy: {
    address: resonanceEnergyAddress,
    abi: resonanceEnergyAbi as Abi
  }
};

export const hasMintContract = Boolean(resonanceGenesisAddress);
export const hasMinerContract = Boolean(chladniNodeMinerAddress);
export const hasResonanceEnergyContract = Boolean(resonanceEnergyAddress);
export const hasContractSetup = hasMintContract && hasMinerContract && hasResonanceEnergyContract;
