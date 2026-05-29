import { FormulaPanel } from "@/components/FormulaPanel";

const sections = [
  ["What is Resonance Genesis?", "Resonance Genesis is a Sepolia-first generative cymatics NFT system. The ERC721 contract mints Chladni Nodes and stores compact on-chain traits used by the miner contract."],
  ["What is a Chladni Node?", "A Chladni Node is a frequency-born NFT artifact. Its metadata lives on Filebase/IPFS, while the contract stores frequency, mode N/M, node density, line thickness, and rarity tier for deterministic mining math."],
  ["Why frequency matters", "Higher frequency produces denser standing-wave structures, so the on-chain approximation weights sqrt(frequency) to reward complexity without pretending Solidity can run floating-point trigonometry."],
  ["What is Chladni mode N/M?", "Mode N and Mode M describe standing-wave layers and nodal crossings. The miner uses modeN * modeM plus a delta term to approximate mode complexity."],
  ["What is the node detector?", "Classic Chladni patterns can be described by f(x,y) = cos(n*x)cos(m*y) - cos(m*x)cos(n*y). The dApp displays this as explanation, while the contract uses integer-safe trait approximations."],
  ["How hashrate is calculated", "baseHashrate = sqrt(frequency)*100 + modeComplexity*40 + nodeDensityBps*3 + lineThicknessBps*2 + symmetryBonus. hashrate = baseHashrate * rarityMultiplier / 100."],
  ["How staking works", "The miner contract accepts approved ResonanceGenesis NFTs, transfers them into escrow, records staked owner and claim timestamp, and computes pending Resonance Energy from hashrate and elapsed seconds."],
  ["How Filebase/IPFS metadata works", "tokenURI resolves to ipfs://<METADATA_CID>/<tokenId>.json. Each metadata file points its image field to ipfs://<IMAGE_CID>/<tokenId>.png. The frontend converts both to NEXT_PUBLIC_IPFS_GATEWAY."],
  ["Why Sepolia first", "Sepolia lets minting, trait setting, staking, claiming, and IPFS metadata be tested with real transactions before mainnet addresses are configured."],
  ["How to switch to mainnet later", "Deploy the same contracts to mainnet, update NEXT_PUBLIC_CHAIN_ID, NEXT_PUBLIC_RPC_URL, NEXT_PUBLIC_RESONANCE_GENESIS_ADDRESS, and NEXT_PUBLIC_CHLADNI_NODE_MINER_ADDRESS, then verify contract ABIs."],
  ["Safety note", "Resonance Energy is an in-app utility point. This project does not promise passive income, APY, guaranteed rewards, or financial return."]
];

export default function DocsPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="font-display text-xs font-bold uppercase tracking-[0.32em] text-[var(--accent)]">Docs</p>
      <h1 className="mt-4 font-display text-5xl font-black uppercase text-[var(--text)]">Resonance mining manual</h1>
      <div className="mt-10">
        <FormulaPanel />
      </div>
      <div className="mt-5 space-y-4">
        {sections.map(([title, copy]) => (
          <article key={title} className="glass-panel rounded-2xl p-6">
            <h2 className="font-display text-xl font-black uppercase text-[var(--text)]">{title}</h2>
            <p className="mt-3 leading-7 text-[var(--muted)]">{copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
