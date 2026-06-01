"use client";

import dynamic from "next/dynamic";

const WalletMultiButton = dynamic(async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton, { ssr: false });

export function SolanaConnectButton() {
  return <WalletMultiButton className="!rounded-full !bg-[var(--accent)] !font-black !text-[var(--bg)] hover:!bg-[var(--accent-2)]" />;
}
